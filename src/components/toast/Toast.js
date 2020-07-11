import { toast as _toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class toast extends _toast {
  static error(message) {
    console.log(message);
    _toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });
  }
  static success(message) {
    console.log(message);
    _toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });
  }

}
