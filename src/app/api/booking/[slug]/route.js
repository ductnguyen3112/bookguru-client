import { NextResponse } from "next/server";
import { connect } from "@/app/dbConfig/dbConfig";
import Business from "@/app/model/businessModel";
import Staff from "@/app/model/staffModel";

connect();

export async function GET(_req, { params }) {
    const { slug } = await params; // Await params before destructuring
    const param = decodeURIComponent(slug);
  
    try {
      // Fetch the business document from the database based on the reviewURL
      const businessData = await Business.findOne({ businessURL: param });
  
      if (!businessData) {
        return NextResponse.redirect("/404");
      }
  
      // Find staffs by businessId
      const staffs = await Staff.find({ businessId: businessData._id });
  
      const business = {
        businessName: businessData.businessName,
        businessAddress: businessData.businessAddress,
        businessPhone: businessData.businessPhone,
        businessDomain: businessData.businessDomain,
        businessDescription: businessData.businessDescription,
        businessCategory: businessData.businessCategory,
        businessTimezone: businessData.businessTimezone,
        businessLogo: businessData.businessLogo,
        staffs: staffs,
        categories: businessData.categories,
        catalogue: businessData.catalogue,
        businessURL: businessData.businessURL,
        staffOptions: businessData.staffOptions,
        bookRange: businessData.bookRange,
        workHours: businessData.workHours,
        photos: businessData.photos,
      };

      console.log("Business data fetched:", business); // Debug log to check fetched data
  
      return NextResponse.json({ business });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  
