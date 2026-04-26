// Xoá member khỏi team
const deleteTeamMember = async (req, res, next) => {
  try {
    const { teamId, playerId } = req.params;
    // Có thể kiểm tra quyền ở đây nếu cần (ví dụ: chỉ manager hoặc organizer)
    const affectedRows = await teamService.deleteTeamMember(teamId, playerId);
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy cầu thủ với ID "${playerId}" trong đội "${teamId}" hoặc đã bị xoá trước đó`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Xoá thành viên khỏi đội thành công"
    });
  } catch (error) {
    console.error("Error in deleteTeamMember:", error);
    next(error);
  }
};
const teamService = require("./teamService");
const { AppError } = require("../../middlewares/errorMiddleware");
const { uploadFileToOCI } = require('../../utils/ociUpload');

// CREATE
const createTeam = async (req, res, next) => {
  try {
    const { name, country = "", description = "" } = req.body;
    const files = req.files || [];

    let logo_url = "";
    let kit_url = [];

    // Upload logo - tìm theo fieldname
    const logoFile = files.find(f => f.fieldname === 'logo');
    if (logoFile) {
      logo_url = await uploadFileToOCI(logoFile);
    }

    // Upload kit - tìm tất cả files có fieldname 'kit'
    const kitFiles = files.filter(f => f.fieldname === 'kit');
    if (kitFiles.length > 0) {
      kit_url = await Promise.all(kitFiles.map(f => uploadFileToOCI(f)));
    }

    // Nếu có URL trong body mà không upload file
    if (req.body.logo_url && !logo_url) {
      logo_url = req.body.logo_url;
    }
    if (req.body.kit_url) {
      kit_url = Array.isArray(req.body.kit_url) ? req.body.kit_url : JSON.parse(req.body.kit_url);
    }

    const team = await teamService.createTeam({
      name: name.trim(),
      country,
      description,
      logo_url,
      kit_url: JSON.stringify(kit_url),
      manager_id: req.user.id
    });

    return res.status(201).json({ success: true, message: "Create team successfully", data: team });
  } catch (error) {
    return next(error);
  }
};

// GET ALL
const getAllTeams = async (req, res, next) => {
  const teams = await teamService.getTeamsByManager(req.user.id);
  return res.status(200).json({ success: true, data: teams });
};

// GET ONE
const getTeamById = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await teamService.getTeamById(teamId);

    if (!team) {
      return next(new AppError("Team not found", 404, "TEAM_NOT_FOUND"));
    }

    return res.status(200).json({
      success: true,
      message: "Get team successfully",
      data: team
    });
  } catch (error) {
    return next(error);
  }
};

// UPDATE
const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const {
      name,
      country,
      description,
      logo_url: logoUrlFromBody,
      kit_url: kitUrlFromBody
    } = req.body;

    const files = Array.isArray(req.files) ? req.files : [];

    // 1. Lấy dữ liệu hiện tại
    const existingTeam = await teamService.getTeamById(teamId);
    if (!existingTeam) {
      return next(new AppError("Team not found", 404, "TEAM_NOT_FOUND"));
    }

    // 2. Validate partial input
    if (name !== undefined && typeof name !== "string") {
      return next(new AppError("Name must be a string", 400, "VALIDATION_ERROR"));
    }

    if (country !== undefined && typeof country !== "string") {
      return next(new AppError("Country must be a string", 400, "VALIDATION_ERROR"));
    }

    if (description !== undefined && typeof description !== "string") {
      return next(new AppError("Description must be a string", 400, "VALIDATION_ERROR"));
    }

    if (name !== undefined && name.trim() === "") {
      return next(new AppError("Name cannot be empty", 400, "VALIDATION_ERROR"));
    }

    // 3. Giữ dữ liệu cũ nếu không gửi field mới
    const finalName = (name ?? existingTeam.name ?? "").trim();
    const finalCountry = country ?? existingTeam.country ?? "";
    const finalDescription = description ?? existingTeam.description ?? "";

    // 4. Giữ ảnh cũ làm mặc định
    let finalLogoUrl = existingTeam.logo_url || "";
    let finalKitUrls = Array.isArray(existingTeam.kit_url) ? existingTeam.kit_url : [];

    // 5. Nếu body có truyền logo_url thì dùng nó
    if (logoUrlFromBody !== undefined) {
      if (typeof logoUrlFromBody !== "string") {
        return next(new AppError("logo_url must be a string", 400, "VALIDATION_ERROR"));
      }
      finalLogoUrl = logoUrlFromBody;
    }

    // 6. Nếu body có truyền kit_url thì parse và dùng nó
    if (kitUrlFromBody !== undefined) {
      try {
        const parsed =
          Array.isArray(kitUrlFromBody) ? kitUrlFromBody : JSON.parse(kitUrlFromBody);

        if (!Array.isArray(parsed)) {
          return next(new AppError("kit_url must be an array", 400, "VALIDATION_ERROR"));
        }

        finalKitUrls = parsed;
      } catch (error) {
        return next(new AppError("kit_url must be a valid JSON array", 400, "VALIDATION_ERROR"));
      }
    }

    // 7. Upload logo mới nếu có
    const logoFile = files.find((file) => file.fieldname === "logo");
    if (logoFile) {
      finalLogoUrl = await uploadFileToOCI(logoFile);
    }

    // 8. Upload kit mới nếu có -> append vào kit cũ
    const kitFiles = files.filter((file) => file.fieldname === "kit");
    if (kitFiles.length > 0) {
      const uploadedKitUrls = await Promise.all(
        kitFiles.map((file) => uploadFileToOCI(file))
      );
      finalKitUrls = [...finalKitUrls, ...uploadedKitUrls];
    }

    // 9. Update DB
    const affectedRows = await teamService.updateTeam(teamId, {
      name: finalName,
      country: finalCountry,
      description: finalDescription,
      logo_url: finalLogoUrl,
      kit_url: JSON.stringify(finalKitUrls),
      manager_id: req.user.id
    });

    if (!affectedRows) {
      return next(
        new AppError(
          "Team not found or you are not the manager",
          404,
          "TEAM_NOT_FOUND_OR_FORBIDDEN"
        )
      );
    }

    // 10. Lấy lại dữ liệu mới nhất
    const updatedTeam = await teamService.getTeamById(teamId);

    return res.status(200).json({
      success: true,
      message: "Update team successfully",
      data: updatedTeam
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE
const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const affectedRows = await teamService.deleteTeam(teamId, req.user.id);

    if (!affectedRows) {
      return next(new AppError(
        "Team not found or you are not the manager",
        404,
        "TEAM_NOT_FOUND_OR_FORBIDDEN"
      ));
    }

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully"
    });
  } catch (error) {
    if (error.code === "TEAM_IN_ACTIVE_TOURNAMENT") {
      return res.status(409).json({
        success: false,
        code: "TEAM_IN_ACTIVE_TOURNAMENT",
        message: error.message,
        data: { tournaments: error.tournaments }
      });
    }
    if (error.code === "TEAM_HAS_MEMBERS") {
      return res.status(409).json({
        success: false,
        code: "TEAM_HAS_MEMBERS",
        message: error.message
      });
    }
    return next(error);
  }
};

//MEMBERS
const getTeamMembers = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "teamId is required",
      });
    }

    const members = await teamService.getTeamMembers(teamId);

    if (!members || members.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No members found for this team",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get team members successfully",
      data: members,
    });
  } catch (error) {
    return next(error);
  }
};
const getTeamMemberById = async (req, res, next) => {
  try {
    const { teamId, playerId } = req.params;
    const member = await teamService.getTeamMemberById(teamId, playerId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy cầu thủ với ID "${playerId}" trong đội "${teamId}"`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get team member successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error in getTeamMemberById:", error);
    next(error);
  }
};

// uploadLogo
const uploadLogo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const logoUrl = await uploadFileToOCI(req.file);
    await teamService.updateTeam(teamId, { logo_url: logoUrl, manager_id: req.user.id });
    return res.status(200).json({ success: true, message: "Logo uploaded", data: { logo_url: logoUrl } });
  } catch (error) { return next(error); }
};

// uploadKit
const uploadKit = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const kitUrls = await Promise.all(req.files.map(f => uploadFileToOCI(f)));
    const existingTeam = await teamService.getTeamById(teamId);
    const existingKits = existingTeam.kit_url || [];
    const newKits = [...existingKits, ...kitUrls];
    await teamService.updateTeam(teamId, { kit_url: JSON.stringify(newKits), manager_id: req.user.id });
    return res.status(200).json({ success: true, message: "Kit uploaded", data: { kit_url: newKits } });
  } catch (error) { return next(error); }
};

const addTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { full_name, age, height_cm, weight_kg, preferred_foot, main_position, jersey_number } = req.body;

    // Upload file hình ảnh lên OCI nếu có, nếu không thì dùng image_url từ body
    let image_url = "";
    if (req.file) {
      image_url = await uploadFileToOCI(req.file);
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }

    // Kiểm tra dữ liệu đầu vào
    if (!full_name || !age || !height_cm || !weight_kg || !preferred_foot || !main_position || !jersey_number) {
      return res.status(400).json({
        success: false,
        message: "All member details are required"
      });
    }

    // Gọi đến teamService để tạo thành viên mới
    const newMember = await teamService.addTeamMember({
      teamId,
      full_name,
      image_url,
      age,
      height_cm,
      weight_kg,
      preferred_foot,
      main_position,
      jersey_number
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: newMember
    });
  } catch (error) {
    console.error("Error in addTeamMember:", error);
    return next(error);
  }
};


module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  getTeamMemberById,
  uploadLogo,
  uploadKit,
  deleteTeamMember,
  addTeamMember
};