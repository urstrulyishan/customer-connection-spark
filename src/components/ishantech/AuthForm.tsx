
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCompany } from "@/contexts/CompanyContext";

// Define our form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentCompany } = useCompany();

  // Set up forms
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle login
  const onLoginSubmit = (values: LoginValues) => {
    if (!currentCompany?.id) return;
    
    // Check if user exists
    const usersKey = `ishantech_users_${currentCompany.id}`;
    const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
    
    const user = storedUsers.find((u: any) => u.email === values.email);
    
    if (!user) {
      toast({
        title: "Login Failed",
        description: "No account found with this email. Please sign up.",
        variant: "destructive",
      });
      return;
    }
    
    if (user.password !== values.password) {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Log the user in
    localStorage.setItem(`ishantech_current_user_${currentCompany.id}`, JSON.stringify(user));
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    });
    
    // Create a login activity for CRM
    logUserActivity(user, "Login");
    
    // Redirect to shop
    navigate("/ishantech-demo");
  };

  // Handle signup
  const onSignupSubmit = (values: SignupValues) => {
    if (!currentCompany?.id) return;
    
    // Check if email already exists
    const usersKey = `ishantech_users_${currentCompany.id}`;
    const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
    
    if (storedUsers.some((u: any) => u.email === values.email)) {
      toast({
        title: "Signup Failed",
        description: "An account with this email already exists. Please login instead.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      name: values.name,
      email: values.email,
      password: values.password,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem(usersKey, JSON.stringify([...storedUsers, newUser]));
    
    // Log the user in
    localStorage.setItem(`ishantech_current_user_${currentCompany.id}`, JSON.stringify(newUser));
    
    // Create a signup activity for CRM
    logUserActivity(newUser, "Account Creation");
    
    toast({
      title: "Signup Successful",
      description: `Welcome to IshanTech, ${values.name}!`,
    });
    
    // Redirect to shop
    navigate("/ishantech-demo");
  };

  // Log activity to CRM
  const logUserActivity = (user: any, activityType: string) => {
    if (!currentCompany?.id) return;
    
    // Create activity for the CRM
    const activity = {
      id: `activity-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      type: activityType,
      timestamp: new Date().toISOString(),
    };
    
    // Add to activities
    const activitiesKey = `customer_activities_${currentCompany.id}`;
    const activities = JSON.parse(localStorage.getItem(activitiesKey) || "[]");
    localStorage.setItem(activitiesKey, JSON.stringify([activity, ...activities]));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? "Login to IshanTech" : "Create an Account"}</CardTitle>
        <CardDescription>
          {isLogin 
            ? "Enter your credentials to access your account" 
            : "Sign up to start shopping with IshanTech"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center w-full">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Button 
            variant="link" 
            className="p-0 ml-1 h-auto" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Login"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
