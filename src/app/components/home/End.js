export default function End() {
  return (
    <section id="contact" className="bg-gray-50 py-12 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <a href="#" className="flex items-center gap-2 mt-10">
              <img alt="BookGuru Logo" src="/logo/logo-main.svg" className="h-10 w-auto" />

            </a>

          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Our Solutions</h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">Appointment Scheduling</a></li>
              <li><a href="#" className="hover:text-gray-900"> Networking and Security</a></li>
              <li><a href="#" className="hover:text-gray-900">Digital Marketing</a></li>
              <li><a href="#" className="hover:text-gray-900">Web Design</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">For Business</h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">For Partners</a></li>
              <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
              <li><a href="#" className="hover:text-gray-900">Payments</a></li>
              <li><a href="#" className="hover:text-gray-900">Support</a></li>
              <li><a href="#" className="hover:text-gray-900">Status</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Find Us on Social</h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">Facebook</a></li>
              <li><a href="#" className="hover:text-gray-900">Twitter</a></li>
              <li><a href="#" className="hover:text-gray-900">LinkedIn</a></li>
              <li><a href="#" className="hover:text-gray-900">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
