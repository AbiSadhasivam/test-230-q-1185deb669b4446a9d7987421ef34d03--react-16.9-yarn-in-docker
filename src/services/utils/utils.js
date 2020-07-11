export const isValidURL = function (str) {
  if (!str) {
    return false;
  }
  var res = str.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
};

export const isValidInterval = function (interval) {
  return interval > 0 && !isNaN(interval);
};
