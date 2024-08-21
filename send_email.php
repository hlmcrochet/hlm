<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $email = htmlspecialchars($_POST['email']);
    $name = htmlspecialchars($_POST['name']);

    // Email configuration
    $to = 'fairyhelly@googlemail.com';
    $subject = 'Newsletter Signup';
    $message = "Name: $name\nEmail: $email\n\nThey would like to sign up for the newsletter.";
    $headers = "From: $email";

    // Send the email
    if (mail($to, $subject, $message, $headers)) {
        echo 'Thank you for signing up to my newsletter!';
    } else {
        echo 'There was a problem signing up to the newsletter, try again later.';
    }
}
?>
