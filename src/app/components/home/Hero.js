export default function Hero() {
  return (
    <div id="home" className="relative isolate pt-14 scroll-mt-24">
      <div className="py-24 sm:py-32 lg:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Scheduler Simplified
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              BookGuru is your ultimate booking software, designed to simplify scheduling and enhance your business operations. Whether you're a client or a partner, our platform offers seamless solutions tailored to your needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/user-flow"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </a>
              <a href="#features" className="text-sm font-semibold text-gray-900">
                Learn More <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl  p-2 ring-1 ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                alt="App screenshot"
                src="/images/hero.jpg"
                className="w-full rounded-md ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
