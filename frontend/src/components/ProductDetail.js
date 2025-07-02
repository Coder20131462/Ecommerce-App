import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  TextField
} from '@mui/material';
import { ArrowBack, Add, Remove, ShoppingCart } from '@mui/icons-material';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const productData = await productService.getProductById(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    
    try {
      await addItem(product.id, quantity);
      alert(`${quantity} ${product.name}(s) added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          Loading product...
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          Product not found
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button onClick={() => navigate('/')} startIcon={<ArrowBack />}>
            Back to Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} sx={{ mb: 3 }}>
        Back to Products
      </Button>

      <Card>
        <Grid container>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              height="400"
              image={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              
              <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                ${product.price}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Chip label={product.category} sx={{ mr: 1 }} />
                <Chip label={product.brand} variant="outlined" />
              </Box>

              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>

              <Typography
                variant="subtitle1"
                color={product.stockQuantity > 0 ? 'success.main' : 'error.main'}
                sx={{ mb: 3 }}
              >
                {product.stockQuantity > 0 
                  ? `${product.stockQuantity} in stock` 
                  : ''
                }
              </Typography>

              {product.stockQuantity > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Quantity:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= product.stockQuantity) {
                          setQuantity(val);
                        }
                      }}
                      type="number"
                      inputProps={{ min: 1, max: product.stockQuantity }}
                      sx={{ mx: 2, width: 80 }}
                    />
                    <IconButton 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                </Box>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default ProductDetail; 