import Customer from "@/models/Customer";
import dbConnect from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!id) {
      return new Response("Customer ID is required", { status: 400 });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }

    return Response.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!id) {
      return new Response("Customer ID is required", { status: 400 });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }

    return Response.json(customer);
  } catch (error) {
    console.error("Error deleting customer:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
