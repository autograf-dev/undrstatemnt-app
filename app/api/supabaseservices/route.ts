import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch all services from Supabase
    const { data, error } = await supabase
      .from("Data_Services")
      .select("*");

    if (error) {
      console.error("Supabase error fetching services:", error);
      return NextResponse.json(
        { error: "Failed to fetch services" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Transform the data to frontend-friendly format
    const services = data.map((service) => {
      const serviceName = service["Service/Name"] || "Unnamed Service";
      // Handle backslash display name issue
      const displayName = (service["Service/Display Name"] === "\\\\" || !service["Service/Display Name"]) 
        ? serviceName 
        : service["Service/Display Name"];
      
      return {
        id: service["🔒 Row ID"] || service.id,
        name: serviceName,
        displayName: displayName,
        duration: service["Service/Duration"] || "0",
        durationDisplay: service["Service/Display Duration"] || service["Service/Duration.Display"] || `${service["Service/Duration"] || 0} mins`,
        price: service["Service/Default Price"] || "0",
        displayPrice: service["Service/Display Price"] || `From $${service["Service/Default Price"] || 0}.00`,
        photo: service["Service/Photo"] || null,
        category: service["Service/Category"] || "Other",
        categoryList: service["Service/Category List"] || service["Service/Category"],
        available: service["Service/Available"],
        barberIds: service["Barber/ID NEW"],
        customPriceList: service["Custom/Price List"],
        customPrice: service["Custom/Price"],
      };
    });

    // Sort by category for better organization
    services.sort((a, b) => (a.category || "").localeCompare(b.category || ""));

    return NextResponse.json(services);
    
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

