<?php
die ("here is ");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "ru198187@gmail.com";
    $subject = $_POST['subject'] ?: "New Contact Form Submission";
    
    $name = strip_tags(trim($_POST['name']));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $topic = strip_tags(trim($_POST['topic']));
    $comment = strip_tags(trim($_POST['comment']));

    $message = "Name: $name\n";
    $message .= "Email: $email\n";
    $message .= "Topic: $topic\n";
    $message .= "Comment: $comment\n";

    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($to, $subject, $message, $headers)) {
        echo "Thank you! Your message has been sent.";
    } else {
        echo "Sorry, something went wrong. Please try again.";
    }
} else {
    echo "Invalid request.";
}
?>
