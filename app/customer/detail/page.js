"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Interests as InterestsIcon,
} from "@mui/icons-material";

function CustomerDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch customer details
  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const id = searchParams.get("id");
      if (!id) {
        showSnackbar("Customer ID is required", "error");
        router.push("/customer");
        return;
      }

      const response = await fetch(`/api/customer?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else if (response.status === 404) {
        showSnackbar("Customer not found", "error");
        router.push("/customer");
      } else {
        showSnackbar("Failed to fetch customer details", "error");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      showSnackbar("Error fetching customer details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const id = searchParams.get("id");
        const response = await fetch(`/api/customer?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSnackbar("Customer deleted successfully!", "success");
          setTimeout(() => {
            router.push("/customer");
          }, 1500);
        } else {
          showSnackbar("Failed to delete customer", "error");
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        showSnackbar("Error deleting customer", "error");
      }
    }
  };

  // Navigate to edit page (we'll create this later)
  const handleEditCustomer = () => {
    const id = searchParams.get("id");
    router.push(`/customer/edit?id=${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Format interests for display
  const formatInterests = (interests) => {
    return interests.split(",").map((interest) => interest.trim());
  };

  // Load customer on component mount
  useEffect(() => {
    fetchCustomer();
  }, [searchParams]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Customer not found. Please check the URL and try again.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/customer")}
          sx={{ mt: 2 }}
        >
          Back to Customer List
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push("/customer")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <PersonIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Customer Details
          </Typography>
          <Button
            color="inherit"
            startIcon={<EditIcon />}
            onClick={handleEditCustomer}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            color="inherit"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCustomer}
          >
            Delete
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Customer Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "fit-content" }}>
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    fontSize: "3rem",
                  }}
                >
                  {customer.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h4" gutterBottom>
                  {customer.name}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  Member #{customer.memberNumber}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Age: {calculateAge(customer.dateOfBirth)} years old
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Customer Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Personal Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <PersonIcon
                              sx={{ mr: 1, color: "action.active" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Full Name
                              </Typography>
                              <Typography variant="h6">
                                {customer.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <CalendarIcon
                              sx={{ mr: 1, color: "action.active" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Date of Birth
                              </Typography>
                              <Typography variant="h6">
                                {formatDate(customer.dateOfBirth)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <BadgeIcon sx={{ mr: 1, color: "action.active" }} />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Member Number
                              </Typography>
                              <Chip
                                label={customer.memberNumber}
                                color="primary"
                                size="medium"
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <CalendarIcon
                              sx={{ mr: 1, color: "action.active" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Age
                              </Typography>
                              <Typography variant="h6">
                                {calculateAge(customer.dateOfBirth)} years old
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Interests */}
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Interests & Hobbies
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <InterestsIcon sx={{ mr: 1, color: "action.active" }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Interests
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {formatInterests(customer.interests).map(
                              (interest, index) => (
                                <Chip
                                  key={index}
                                  label={interest}
                                  color="secondary"
                                  variant="outlined"
                                  size="medium"
                                />
                              )
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Additional Information */}
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Additional Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Customer ID
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {customer._id}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Registration Date
                          </Typography>
                          <Typography variant="body1">
                            {new Date(
                              customer.createdAt || customer._id
                            ).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/customer")}
            size="large"
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditCustomer}
            size="large"
          >
            Edit Customer
          </Button>
        </Box>

        {/* Floating Action Button for Quick Edit */}
        <Fab
          color="primary"
          aria-label="edit"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={handleEditCustomer}
        >
          <EditIcon />
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

export default function CustomerDetail() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      }
    >
      <CustomerDetailContent />
    </Suspense>
  );
}
