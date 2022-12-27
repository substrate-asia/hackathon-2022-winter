import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div>
      <section className="flex  h-screen  items-center bg-gray p-16 text-blackText">
        <div className="container mx-auto my-8 flex flex-col items-center justify-center px-5">
          <div className="max-w-md text-center">
            <h2 className="mb-8 text-9xl font-extrabold text-gray">
              <span className="sr-only">Error</span>404
            </h2>
            <p className="text-2xl font-semibold text-blackText md:text-3xl">
              Sorry, we could not find this page.
            </p>
            <p className="mt-4 mb-8 text-gray">
              But dont worry, you can find plenty of other things on our
              homepage.
            </p>
            <Link to="/" className=" rounded px-8 py-3 font-semibold text-gray">
              <div className="rounded px-8 py-3 font-semibold text-primary">
                Back to homepage
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
