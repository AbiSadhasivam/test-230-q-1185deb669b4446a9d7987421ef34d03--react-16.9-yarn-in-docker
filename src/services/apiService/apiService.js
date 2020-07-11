export const apiFetch = async (endpoint, requestType, data) => {
  let apiEndpoint = endpoint;
  try {
    let request = await getRequest(requestType, data);
    let result = await fetch(apiEndpoint, request);
    result = handleValidResponse(result);
    return result.json();
  } catch (error) {
    return Promise.reject(error);
  }
};
async function getRequest(requestType, body) {
  let request = {
    method: requestType,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (body) {
    request.body = JSON.stringify(body);
  }

  return Promise.resolve(request);
}

function handleValidResponse(result) {
  if (result.status >= 200 && result.status < 300) {
    return result;
  }

  if (!result.status) {
    let error = new Error('Backend not responding');
    error.response = result;
    throw error;
  }

  let error = new Error(result.statusText);
  error.response = result;
  throw error;
}
