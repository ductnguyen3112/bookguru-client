// ... other imports

import Footer from "@/app/components/common/Footer";

export async function generateMetadata({ params }) {
  try {
  const awaitedParams = await params;
  const slug = decodeURIComponent(awaitedParams.slug);
    const res = await fetch(
      `https://bookguru-client.vercel.app/api/booking/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to load business");
    const json = await res.json();
    const b = json?.business || {};

    const titleBase = b.businessName || "BookGuru";
    const address = b.businessAddress ? ` - ${b.businessAddress}` : "";
    const title = `${titleBase}${address}`;
    const description =
      b.businessDescription ||
      `Book appointments with ${titleBase}. View services, availability, and contact details.`;

    return {
      title,
      description,
      keywords: [
        "BookGuru",
        "booking",
        "salon",
        "spa",
        titleBase,
        b.businessURL || slug,
      ],
      openGraph: {
        title,
        description,
        type: "website",
        images: b.businessLogo ? [b.businessLogo] : undefined,
        url: `/v1/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: b.businessLogo ? [b.businessLogo] : undefined,
      },
    };
  } catch (e) {
    return {
      title: "BookGuru",
      description: "Discover and book salon and spa appointments with BookGuru.",
      openGraph: {
        title: "BookGuru",
        description:
          "Discover and book salon and spa appointments with BookGuru.",
        type: "website",
      },
    };
  }
}

export default function Layout({ children }) {
  return (
    <main className="flex-grow">
      {children}
      <Footer />
    </main>
  );
}
