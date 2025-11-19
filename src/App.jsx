import { RouterProvider } from "react-router-dom"
import { Provider } from "react-redux"
import { ToastContainer } from "react-toastify"
import { router } from "@/router"
import { store } from "@/store"

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </Provider>
  )
}

export default App