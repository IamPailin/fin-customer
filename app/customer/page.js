"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Container,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

export default function CustomerManagement() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    memberNumber: "",
    interests: "",
  });

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `/api/customer?s=${encodeURIComponent(searchTerm)}`
        : "/api/customer";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        showSnackbar("Failed to fetch customers", "error");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showSnackbar("Error fetching customers", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      dateOfBirth: "",
      memberNumber: "",
      interests: "",
    });
  };

  // Add new customer
  const handleAddCustomer = async () => {
    try {
      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSnackbar("Customer added successfully!", "success");
        setOpenAddDialog(false);
        resetForm();
        fetchCustomers();
      } else {
        const error = await response.text();
        showSnackbar(error || "Failed to add customer", "error");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      showSnackbar("Error adding customer", "error");
    }
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      dateOfBirth: customer.dateOfBirth.split("T")[0], // Format for date input
      memberNumber: customer.memberNumber.toString(),
      interests: customer.interests,
    });
    setOpenEditDialog(true);
  };

  // Update customer
  const handleUpdateCustomer = async () => {
    try {
      const response = await fetch("/api/customer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: editingCustomer._id,
          ...formData,
        }),
      });

      if (response.ok) {
        showSnackbar("Customer updated successfully!", "success");
        setOpenEditDialog(false);
        setEditingCustomer(null);
        resetForm();
        fetchCustomers();
      } else {
        const error = await response.text();
        showSnackbar(error || "Failed to update customer", "error");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      showSnackbar("Error updating customer", "error");
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`/api/customer/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSnackbar("Customer deleted successfully!", "success");
          fetchCustomers();
        } else {
          showSnackbar("Failed to delete customer", "error");
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        showSnackbar("Error deleting customer", "error");
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format interests for display
  const formatInterests = (interests) => {
    return interests.split(",").map((interest) => interest.trim());
  };

  // Navigate to customer detail page
  const handleViewCustomer = (customerId) => {
    router.push(`/customer/${customerId}`);
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search customers when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <PersonIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Customer Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Search and Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search customers by name or interests"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchCustomers}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddDialog(true)}
                  >
                    Add Customer
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customers ({customers.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>Member Number</TableCell>
                    <TableCell>Interests</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <Button
                          variant="text"
                          onClick={() => handleViewCustomer(customer._id)}
                          sx={{
                            textTransform: "none",
                            justifyContent: "flex-start",
                            p: 0,
                            "&:hover": {
                              backgroundColor: "transparent",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <Typography variant="subtitle2" color="primary">
                            {customer.name}
                          </Typography>
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(customer.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Chip
                          label={customer.memberNumber}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {formatInterests(customer.interests).map(
                            (interest, index) => (
                              <Chip
                                key={index}
                                label={interest}
                                size="small"
                                variant="outlined"
                              />
                            )
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Customer Details">
                          <IconButton
                            color="info"
                            onClick={() => handleViewCustomer(customer._id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Customer">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Customer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {customers.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No customers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Add your first customer to get started"}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add Customer Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Member Number"
                name="memberNumber"
                type="number"
                value={formData.memberNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Interests"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., movies, football, gym, gaming"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer} variant="contained">
              Add Customer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Member Number"
                name="memberNumber"
                type="number"
                value={formData.memberNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Interests"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., movies, football, gym, gaming"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateCustomer} variant="contained">
              Update Customer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setOpenAddDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
