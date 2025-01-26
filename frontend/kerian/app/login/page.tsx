"use client"
import { Alert, Box, Button, FormGroup, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
      });
      const [error, setError] = useState<string | null>();
      const [success, setSuccess] = useState(false);
    
      // TODO: anyt kicserélni
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    
      //TODO: anyt kicserélni
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleSubmit = async (e:any) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
    
        try {
          const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
    
          if (response.status === 200) {
            setSuccess(true);
            setFormData({ email: '', password: '' });
            if (response.body){
                const user = await response.json();
                localStorage.setItem("user",user.username)
                window.dispatchEvent(new Event("userChanged"))
            }
          } else {
            const data = await response.json();
            setError(data.message || 'An error occurred while logging in.');
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setError('An error occurred while logging in.');
        }
      };
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>Login successful!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="email"
            fullWidth
            required
          />

          <TextField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="password"
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </FormGroup>
      </form>
    </Box>
  );
}
