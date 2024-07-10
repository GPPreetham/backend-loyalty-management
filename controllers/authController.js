const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if email already exists
    const { data: emailData, error: emailError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email);

    if (emailError) {
      return res.status(400).json({
        status: "error",
        message: "Database query error",
        statusCode: 400,
      });
    }

    if (emailData.length > 0) {
      return res.status(201).json({
        status: "failed",
        message: "Email already exists",
        statusCode: 201,
      });
    }

    // Check if username already exists
    const { data: usernameData, error: usernameError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username);

    if (usernameError) {
      return res.status(400).json({
        status: "error",
        message: "Database query error",
        statusCode: 400,
      });
    }

    if (usernameData.length > 0) {
      return res.status(202).json({
        status: "failed",
        message: "Username already exists",
        statusCode: 202,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ username, email, password: hashedPassword, login_status: 0 }]);

    if (insertError) {
      return res.status(400).json({
        status: "error",
        message: "User registration error",
        statusCode: 400,
      });
    }

    res.status(200).json({
      status: "success",
      message: "User registered successfully",
      statusCode: 200,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "An unexpected error occurred",
      statusCode: 400,
    });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: data.id, username: data.username, email: data.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );

    let loginStatus = data.login_status;

    if (loginStatus === 0) {
      loginStatus = 1;
    } else if (loginStatus === 1) {
      loginStatus = 2;
    }

    await supabase
      .from("users")
      .update({ login_status: loginStatus })
      .eq("id", data.id);

    res.status(200).json({
      token,
      username: data.username,
      email: data.email,
      loginStatus,
      message: "Success",
      StatusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
