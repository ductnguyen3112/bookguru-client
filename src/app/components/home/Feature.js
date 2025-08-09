import { MapPinIcon, ClockIcon, CursorArrowRaysIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';

const features = [
	// combined with our SEO and marketing efforts, this feature helps to attract more clients
    // description : combined with our SEO and marketing efforts, this feature helps to attract more clients


  {
    name: 'Effortless Appointment Management',
    description: 'Streamline your business operations by easily managing, rescheduling, or canceling appointments with full control.',
    icon: ClockIcon,
  },
  {
    name: 'Simplified Booking Process',
    description: 'Provide your clients with a seamless booking experience, reducing friction and increasing satisfaction.',
    icon: CursorArrowRaysIcon,
  },
  // Login with phone number to ensure client secure access and authentication
  {
    name: 'Secure Client Access',
    description: 'Ensure secure and personalized client interactions with phone number-based login and authentication.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Expand Your Reach',
    description:
      'Boost your business visibility and attract more clients with our integrated SEO and digital marketing tools.',
    icon: MapPinIcon,
    },
];

export default function Feature() {
  return (
    <div id="features" className="scroll-mt-24 overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold text-indigo-600">Why Choose Us</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Features That Make a Difference
              </p>
              <p className="mt-6 text-lg text-gray-700">
                Discover how BookGuru can transform your business operations with cutting-edge features tailored to your needs.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-600" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src="/images/features.jpg"
            width={2432}
            height={1442}
            className="w-full max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
}
