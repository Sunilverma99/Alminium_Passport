import React from 'react'

function Footer() {
  return (
    // <div classNameName=" bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white z-0">
    //     <footer classNameName="bg-gray-900 py-3 border-t border-gray-500/20">
    //     <div classNameName="container mx-auto px-4 text-center">
    //       <p classNameName="text-sm text-gray-400">© 2024 Marklytics. All Rights Reserved.</p>
    //     </div>
    //   </footer>
    // </div>
    

<footer className="bg-white rounded-lg shadow-sm dark:bg-gray-900 ">
    <div className="w-full  mx-auto p-2 ">
        {/* <div className="sm:flex sm:items-center sm:justify-between">
            <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                <img src="./Logo.png" className="h-8" alt="Flowbite Logo" />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Marklytics</span>
            </a>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">About</a>
                </li>
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                </li>
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                </li>
                <li>
                    <a href="#" className="hover:underline">Contact</a>
                </li>
            </ul>
        </div> */}
        <hr className=" border-gray-200 sm:mx-auto dark:border-gray-700 mb-4" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a href="https://www.marklytics.co.uk/" className="hover:underline">Marklytics</a>. All Rights Reserved.</span>
    </div>
</footer>


  )
}

export default Footer