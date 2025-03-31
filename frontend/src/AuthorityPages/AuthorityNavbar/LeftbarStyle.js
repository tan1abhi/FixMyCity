import { makeStyles } from '@mui/styles';

export const LeftbarStyle = makeStyles(theme => ({
    drawer : {
        [theme.breakpoints.up('sm')]:{
            width: '200px'
        }
    },
    drawerPaper:{
        width: '200px',
        color: 'white',
        backgroundColor: '#011117'
    },
    logoDiv: {
        borderBottom: '1px solid #011117',
        padding: theme.spacing(4)
    },
    logoStyle: {
        width: theme.spacing(14),
        height: theme.spacing(8)
    },
    active: {
        backgroundColor: 'rgb(50, 59, 183)',
        borderBottom: '1px solid rgb(123, 125, 156)'
    },
    notActive: {
        borderBottom: '1px solid rgb(123, 125, 156)'
    },
    linkIcon: {
        color: '#ffb300'
    }
}))