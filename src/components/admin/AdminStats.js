import { Card, CardContent, Typography, Grid } from "@mui/material";

const AdminStats = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Всего пользователей
            </Typography>
            <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Администраторов
            </Typography>
            <Typography variant="h4">{stats?.totalAdmins || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Заблокировано
            </Typography>
            <Typography variant="h4">
              {stats?.totalBlockedUsers || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminStats;
