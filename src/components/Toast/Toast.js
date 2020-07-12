import { toast as _toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class Toast extends _toast {
  constructor() {
    super();
    this.settings = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };
  }
  static error(message) {
    _toast.error(message, this.settings);
  }
  static success(message) {
    _toast.success(message, this.settings);
  }
}
