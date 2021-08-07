import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import logo from '../../../assets/images/WebHeader.png';

const Header = () => {
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
  headerRootFixed: {
    left: 0,
    right: 0,
    top: 0,
    position: 'fixed',
    padding: '40px 0px',
    boxShadow: 'inset 0 10px 10px -10px rgb(0 0 0 / 10%), inset 0 -10px 10px -10px rgb(0 0 0 / 10%)',
    zIndex: 1,
    [theme.breakpoints.down("md")]: {
      padding: '0 24px'
    }
  },
  logo: {
    [theme.breakpoints.down("sm")]: {
      height: 50
    }
  },
  container: {
    padding: '40px 0px',
    boxShadow: 'inset 0 10px 10px -10px rgb(0 0 0 / 10%), inset 0 -10px 10px -10px rgb(0 0 0 / 10%)',
    [theme.breakpoints.down("md")]: {
      padding: '16px 0px'
    }
  }
}));

export default Header;
