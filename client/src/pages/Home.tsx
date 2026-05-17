import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sports, AccessTime, AttachMoney, Star } from '@mui/icons-material'

const features = [
  { icon: <Sports />, title: 'Premium Tables', desc: 'Professional pool and snooker tables' },
  { icon: <AccessTime />, title: 'Easy Booking', desc: 'Book your slot in seconds' },
  { icon: <AttachMoney />, title: 'Best Rates', desc: 'Competitive pricing for all' },
  { icon: <Star />, title: '24/7 Support', desc: 'We are here to help anytime' },
]

const Home: React.FC = () => {
  return (
    <Box>
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          background: 'radial-gradient(circle at 50% 50%, rgba(57,255,20,0.1) 0%, transparent 50%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(90deg, #39FF14, #D4AF37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Pool & Snooker Zone
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                  Experience the thrill of professional billiards. Book your table now and enjoy premium gaming experience.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/book"
                    variant="contained"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Book Now
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Join Now
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    background: 'linear-gradient(135deg, rgba(57,255,20,0.2) 0%, rgba(212,175,55,0.2) 100%)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(57,255,20,0.3)',
                    boxShadow: '0 0 60px rgba(57,255,20,0.2)',
                  }}
                >
                  <Sports sx={{ fontSize: 150, color: 'primary.main' }} />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{ mb: 6 }}>
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom>
                Professional Gaming Experience
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Our facility features state-of-the-art pool and snooker tables maintained to professional standards.
                Whether you're a casual player or a serious competitor, we have the perfect table for you.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Book your session today and experience the best gaming atmosphere in town!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 300,
                  background: 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
              >
                <Typography variant="h6" color="secondary">
                  Premium Tables Available
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default Home