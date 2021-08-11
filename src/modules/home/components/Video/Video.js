import React from 'react';
import { makeStyles } from '@material-ui/core';
import BackgroundMP4 from '../../../../assets/images/Line_background.mp4';


const BackgroundVideo = () => {
  const styles = useStyles();

  return (
    <div>
      <video
        autoPlay
        muted
        loop
        className={styles.backgroundVideo}>
        <source src={BackgroundMP4} type="video/mp4"></source>
      </video>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  backgroundVideo: {
    position: 'fixed',
    width: '100%',
    left: '50%',
    top: '50%',
    height: '100%',
    objectFit: 'cover',
    transform: 'translate(-50%, -50%)',
    zIndex: -3
  }
}));

export default BackgroundVideo;
