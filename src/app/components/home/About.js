export default function About() {
  return (
    <div id="about" className="scroll-mt-24 overflow-hidden bg-white ">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="max-w-4xl">
          <p className="text-base font-semibold text-indigo-600">About Us</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Empowering Businesses with Seamless Scheduling
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            At BookGuru, we are dedicated to revolutionizing the way businesses and clients manage appointments. Our mission is to provide a user-friendly platform that simplifies scheduling, enhances productivity, and fosters growth for businesses of all sizes.
          </p>
        </div>
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
          <div className="lg:pr-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Our Mission</h2>
            <p className="mt-6 text-base text-gray-600">
              We aim to bridge the gap between businesses and their clients by offering a robust scheduling solution. Our platform is designed to streamline operations, reduce no-shows, and improve customer satisfaction.
            </p>
            <p className="mt-8 text-base text-gray-600">
              With BookGuru, businesses can focus on what they do best while we handle the complexities of appointment management. Join us in transforming the way the world schedules.
            </p>
          </div>
          <div className="pt-16 lg:row-span-2 lg:-mr-16 xl:mr-auto">
            <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <img
                  alt="Team collaboration"
                  src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?&auto=format&fit=crop&crop=center&w=560&h=560&q=90"
                  className="block w-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <img
                  alt="Business growth"
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?&auto=format&fit=crop&crop=left&w=560&h=560&q=90"
                  className="block w-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <img
                  alt="Scheduling software"
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?&auto=format&fit=crop&crop=left&w=560&h=560&q=90"
                  className="block w-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <img
                  alt="Customer satisfaction"
                  src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?&auto=format&fit=crop&crop=center&w=560&h=560&q=90"
                  className="block w-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="max-lg:mt-16 lg:col-span-1">
            <p className="text-base font-semibold text-gray-500">Our Impact</p>
            <hr className="mt-6 border-t border-gray-200" />
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4">
                <dt className="text-sm text-gray-600">Appointments Managed</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900">
                  <span>10</span>M
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4">
                <dt className="text-sm text-gray-600">Businesses Served</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900">
                  <span>50</span>K
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 max-sm:border-b max-sm:border-dotted max-sm:border-gray-200 max-sm:pb-4">
                <dt className="text-sm text-gray-600">Hours Saved</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900">
                  <span>5</span>M
                </dd>
              </div>
              <div className="flex flex-col gap-y-2">
                <dt className="text-sm text-gray-600">Customer Satisfaction</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900">
                  <span>98</span>%
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
