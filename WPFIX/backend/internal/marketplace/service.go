package marketplace

import (
	"errors"
	"math"
)

type MarketplaceService struct {
	repo *MarketplaceRepository
}

func NewMarketplaceService(repo *MarketplaceRepository) *MarketplaceService {
	return &MarketplaceService{repo: repo}
}

// GetAllProducts gets all products with pagination and filters
func (s *MarketplaceService) GetAllProducts(params ProductListParams) (*ProductListResponse, error) {
	// Default pagination
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 20
	}

	products, total, err := s.repo.GetAll(params)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(params.Limit)))

	return &ProductListResponse{
		Products:   products,
		Total:      total,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalPages: totalPages,
	}, nil
}

// GetProductByID gets product by ID
func (s *MarketplaceService) GetProductByID(productID uint) (*Product, error) {
	return s.repo.FindByID(productID)
}

// CreateProduct creates a new product
func (s *MarketplaceService) CreateProduct(req *CreateProductRequest, adminID uint) (*Product, error) {
	product := &Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
		Status:      "active",
		CreatedBy:   adminID,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, errors.New("failed to create product")
	}

	return product, nil
}

// UpdateProduct updates product
func (s *MarketplaceService) UpdateProduct(productID uint, req *UpdateProductRequest) (*Product, error) {
	// Check if product exists
	_, err := s.repo.FindByID(productID)
	if err != nil {
		return nil, err
	}

	// Prepare updates
	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Price > 0 {
		updates["price"] = req.Price
	}
	if req.Stock >= 0 {
		updates["stock"] = req.Stock
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	// Update product
	if len(updates) > 0 {
		if err := s.repo.Update(productID, updates); err != nil {
			return nil, errors.New("failed to update product")
		}
	}

	// Return updated product
	return s.repo.FindByID(productID)
}

// DeleteProduct deletes product
func (s *MarketplaceService) DeleteProduct(productID uint) error {
	// Check if product exists
	_, err := s.repo.FindByID(productID)
	if err != nil {
		return err
	}

	return s.repo.Delete(productID)
}
