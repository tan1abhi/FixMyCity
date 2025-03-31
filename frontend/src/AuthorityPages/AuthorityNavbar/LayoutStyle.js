import { makeStyles } from '@mui/styles';

export const LayoutStyle = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100%',
  },
  topbarWidth: {
    ...theme.mixins.toolbar, // Spacer for AppBar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: 'white',
    minHeight: '100vh',
    boxSizing: 'border-box',
    [theme.breakpoints.up('sm')]: {
      marginLeft: '200px',
    },
  },
}));
