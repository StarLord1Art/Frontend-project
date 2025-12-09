import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from './pages/Main';
import Todo from './pages/Todo';
import Error from './pages/Error';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main/>
    },
    {
      path: "todo/:id",
      element: <Todo/>
    },
    {
      path: "/error",
      element: <Error/>
    }
  ])

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
