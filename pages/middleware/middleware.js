// pages/middleware/middleware.js
import { NextResponse } from 'next/server';

// Get username and password from environment variables
const authUsername = process.env.AUTH_USERNAME;
const authPassword = process.env.AUTH_PASSWORD;

// Function to decode the Basic Auth header
const decodeBasicAuth = (authHeader) => {
  if (!authHeader) return null;

  try {
    const [, encoded] = authHeader.split(' '); // Split "Basic <encoded string>"
    const decodedString = Buffer.from(encoded, 'base64').toString('utf8');
    return decodedString;
  } catch (error) {
    return null;
  }
};

export async function middleware(req) {
  const url = req.nextUrl;

  // Define the paths where authentication is required
  const protectedPaths = ["/dashboard", "/admin/*"];

  // Check if the request is for a protected path
  if (protectedPaths.some(path => url.pathname.startsWith(path))) {
    const authHeader = req.headers.get("authorization");

    // Decode the Basic Auth header
    const decodedAuth = decodeBasicAuth(authHeader);

    // Check if the decoded authentication is valid
    if (decodedAuth) {
      const [username, password] = decodedAuth.split(':');

      if (username === authUsername && password === authPassword) {
        // Basic Auth is valid, allow the request to proceed
        return NextResponse.next();
      } else {
        // Invalid credentials
        return new Response("Not authorized - Invalid credentials", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Area"'
          }
        });
      }
    } else {
      // Basic Auth is invalid, return a 401 Unauthorized response
      return new Response("Not authorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"'
        }
      });
    }
  }

  // If the request is not for a protected path, allow it to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: protectedPaths, // Specify the paths where the middleware should run
};
