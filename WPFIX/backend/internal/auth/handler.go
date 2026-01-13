package auth

import (
	"net/http"
	"wallet-point/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// Login handles user login
// @Summary User login
// @Description Authenticate user and return JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} utils.Response{data=LoginResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	response, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", response)
}

// Register handles user registration (admin only)
// @Summary Register new user
// @Description Create a new user account (Admin only)
// @Tags Auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body RegisterRequest true "User details"
// @Success 201 {object} utils.Response{data=User}
// @Failure 400 {object} utils.Response
// @Failure 409 {object} utils.Response
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	user, err := h.service.Register(&req)
	if err != nil {
		statusCode := http.StatusBadRequest
		if err.Error() == "email already registered" || err.Error() == "NIM/NIP already registered" {
			statusCode = http.StatusConflict
		}
		utils.ErrorResponse(c, statusCode, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", user)
}

// Me handles get current user profile
// @Summary Get current user
// @Description Get authenticated user profile
// @Tags Auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=User}
// @Failure 401 {object} utils.Response
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetUint("user_id")

	user, err := h.service.GetUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User retrieved successfully", user)
}
