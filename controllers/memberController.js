const supabase = require("../supabaseClient");

// Get all members
const getMembers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("members").select("*");

    if (error) {
      console.error("Error fetching members:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while fetching members",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while fetching users",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
// Add a new member
// const addMember = async (req, res) => {
//   const { name, email, member_id, points } = req.body;

//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .insert([{ name, email, member_id, points }])
//       .select("*");

//     if (error) {
//       console.error("Error adding member:", error);
//       return res.status(500).json({
//         status: "error",
//         message: "An error occurred while adding the member",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Member created successfully",
//       data: data[0],
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const addMember = async (req, res) => {
  const { name, email, member_id, points } = req.body;

  try {
    // Check if email or member_id already exists
    const { data: existingMembers, error } = await supabase
      .from("members")
      .select("*")
      .or(`email.eq.${email},member_id.eq.${member_id}`);

    if (error) {
      console.error("Error checking existing members:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while checking existing members",
      });
    }

    if (existingMembers && existingMembers.length > 0) {
      const existingMember = existingMembers.find(
        (member) => member.email === email || member.member_id === member_id
      );

      if (existingMember.email === email) {
        return res.status(201).json({
          status: "error",
          message: "Email already exists.",
        });
      } else if (existingMember.member_id === member_id) {
        return res.status(202).json({
          status: "error",
          message: "Member ID already exists.",
        });
      }
    }

    // If no existing member found, proceed with adding new member
    const { data, error: insertError } = await supabase
      .from("members")
      .insert([{ name, email, member_id, points }])
      .select("*");

    if (insertError) {
      console.error("Error adding member:", insertError);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while adding the member",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Member created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete a member by member_id
const deleteMember = async (req, res) => {
  const { member_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("members")
      .delete()
      .eq("member_id", member_id)
      .select("*");

    if (error) {
      console.error("Error deleting member:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while deleting the member",
      });
    }

    if (data.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.json({
      status: "success",
      message: "Member deleted successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update a member by member_id
// const updateMember = async (req, res) => {
//   const { member_id } = req.params;
//   const { name, email, points } = req.body;

//   try {
//     const { data, error } = await supabase
//       .from("members")
//       .update({ name, email, points })
//       .eq("member_id", member_id)
//       .select("*");

//     if (error) {
//       console.error("Error updating member:", error);
//       return res.status(500).json({
//         status: "error",
//         message: "An error occurred while updating the member",
//       });
//     }

//     if (data.length === 0) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Member not found" });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Member updated successfully",
//       data: data[0],
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const updateMember = async (req, res) => {
  const { member_id } = req.params;
  const { name, email, points } = req.body;

  try {
    // Check if email or member_id already exists for other members
    const { data: existingMembers, error: checkError } = await supabase
      .from("members")
      .select("*")
      .or(`email.eq.${email},member_id.eq.${member_id}`);

    if (checkError) {
      console.error("Error checking existing members:", checkError);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while checking existing members",
      });
    }

    if (existingMembers && existingMembers.length > 0) {
      const existingMember = existingMembers.find(
        (member) => member.member_id !== member_id && member.email === email
      );

      if (existingMember) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists for another member.",
        });
      }
    }

    // Proceed with updating the member
    const { data, error: updateError } = await supabase
      .from("members")
      .update({ name, email, points })
      .eq("member_id", member_id)
      .select("*");

    if (updateError) {
      console.error("Error updating member:", updateError);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while updating the member",
      });
    }

    if (data.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Member updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getMemberById = async (req, res) => {
  const { member_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("member_id", member_id)
      .single();

    if (error) {
      console.error("Error fetching member details:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while fetching member details",
      });
    }

    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getUserByNameOrEmail = async (req, res) => {
  const { identifier } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while fetching user details",
      });
    }

    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getMembers,
  addMember,
  deleteMember,
  updateMember,
  getMemberById,
  getUsers,
  getUserByNameOrEmail,
};
