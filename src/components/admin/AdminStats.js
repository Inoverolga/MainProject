import { Card, CardContent, Typography, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

const AdminStats = ({ stats }) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item size={{ xs: 12, sm: 4 }}>
        <Card
          sx={{
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom>
              {t("totalUsers")}
            </Typography>
            <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item size={{ xs: 12, sm: 4 }}>
        <Card
          sx={{
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom>
              {t("administrators")}
            </Typography>
            <Typography variant="h4">{stats?.totalAdmins || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item size={{ xs: 12, sm: 4 }}>
        <Card
          sx={{
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              width: "100%",
              p: 5,
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom>
              {t("blocked")}
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
