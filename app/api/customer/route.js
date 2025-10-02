import Customer from "@/models/Customer";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";

// GET customers (with ?id=, ?s=, or ?pno=)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Single by ID
    const id = searchParams.get("id");
    if (id) {
      const customer = await Customer.findById(id);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(customer, { status: 200 });
    }

    // Search
    const s = searchParams.get("s");
    if (s) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { interests: { $regex: s, $options: "i" } },
        ],
      }).sort({ memberNumber: 1 });
      return NextResponse.json(customers, { status: 200 });
    }

    // Pagination
    const pno = parseInt(searchParams.get("pno"), 10);
    if (!isNaN(pno) && pno > 0) {
      const size = 10;
      const startIndex = (pno - 1) * size;
      const customers = await Customer.find()
        .sort({ memberNumber: 1 })
        .skip(startIndex)
        .limit(size);
      return NextResponse.json(customers, { status: 200 });
    }

    // All customers
    const customers = await Customer.find().sort({ memberNumber: 1 });
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST create new customer
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (
      !body.name ||
      !body.dateOfBirth ||
      !body.memberNumber ||
      !body.interests
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customer = new Customer(body);
    await customer.save();
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Member number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT update existing customer (replace)
export async function PUT(request) {
  return handleUpdate(request);
}

// PATCH update existing customer (partial)
export async function PATCH(request) {
  return handleUpdate(request);
}

// DELETE customer by id
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// helper to handle PUT & PATCH
async function handleUpdate(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Member number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
