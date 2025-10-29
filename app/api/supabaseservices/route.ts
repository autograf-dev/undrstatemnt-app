import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("Data_Services")
      .select("*")
      .eq("Service/Available", "true")
      .order("Service/Category", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to a more frontend-friendly format
    const services = data?.map((service) => ({
      id: service["🔒 Row ID"],
      name: service["Service/Name"] || service["Service/Display Name"],
      displayName: service["Service/Display Name"] || service["Service/Name"],
      duration: service["Service/Duration"],
      durationDisplay: service["Service/Display Duration"] || service["Service/Duration.Display"] || `${service["Service/Duration"]} mins`,
      price: service["Service/Default Price"],
      displayPrice: service["Service/Display Price"] || `From $${service["Service/Default Price"]}.00`,
      photo: service["Service/Photo"],
      category: service["Service/Category"],
      categoryList: service["Service/Category List"],
      available: service["Service/Available"],
      barberIds: service["Barber/ID NEW"],
      customPriceList: service["Custom/Price List"],
      customPrice: service["Custom/Price"],
    })) || [];

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

