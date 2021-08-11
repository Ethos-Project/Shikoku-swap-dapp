import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import logo from '../../../assets/images/Group0.png';

const Footer = () => {
  const styles = useStyles();

  return (
    <Grid container alignItems="center" justifyContent="center" className={styles.container}>
      <Grid item>
        <Typography variant="h4" component="h3">
          <img src={logo} alt="bug" className={styles.logo}/>
        </Typography>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  logo: {
    height: 50,
    [theme.breakpoints.down("sm")]: {
      height: 40
    }
  },
  container: {
    padding: '10px 0px',
    boxShadow: 'inset 0 10px 10px -10px rgb(0 0 0 / 10%), inset 0 -10px 10px -10px rgb(0 0 0 / 10%)',
    [theme.breakpoints.down("md")]: {
      padding: '16px 0px'
    }
  }
}));

export default Footer;
