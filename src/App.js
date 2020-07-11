import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { ToastContainer } from 'react-toastify';
import SegmentVideo from '../src/components/SegmentVideo/SegmentVideo';

function App() {
  return (
    <>
      <ToastContainer />
      <SegmentVideo></SegmentVideo>
    </>
  );
}

export default App;
