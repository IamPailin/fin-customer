import Customer from "@/models/Customer";
import dbConnect from "@/lib/db";

export async function GET(request) {
  try {
    await dbConnect();

    // Handle search parameter
    const s = request.nextUrl.searchParams.get("s");
    if (s) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { interests: { $regex: s, $options: "i" } },
        ],
      }).sort({ memberNumber: 1 });
      return Response.json(customers);
    }

    // Handle pagination parameter
    const pno = request.nextUrl.searchParams.get("pno");
    if (pno) {
      const size = 10;
      const startIndex = (pno - 1) * size;
      const customers = await Customer.find()
        .sort({ memberNumber: 1 })
        .skip(startIndex)
        .limit(size);
      return Response.json(customers);
    }

    // Return all customers
    const customers = await Customer.find().sort({ memberNumber: 1 });
    return Response.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.dateOfBirth ||
      !body.memberNumber ||
      !body.interests
    ) {
      return new Response("Missing required fields", { status: 400 });
    }

    const customer = new Customer(body);
    await customer.save();
    return Response.json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === 11000) {
      return new Response("Member number already exists", { status: 409 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    const customer = await Customer.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }
    return Response.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.code === 11000) {
      return new Response("Member number already exists", { status: 409 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    const customer = await Customer.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }
    return Response.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.code === 11000) {
      return new Response("Member number already exists", { status: 409 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
