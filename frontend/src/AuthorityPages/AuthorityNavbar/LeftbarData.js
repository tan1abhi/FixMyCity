import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

export const LeftbarData = [
    {
        id: 1,
        title: 'Home',
        path: '/home',
        icon: <HomeIcon />
    },
    {
        id: 2,
        title: 'Profile',
        path: '/profile',
        icon: <AccountCircleIcon />
    },
    {
        id: 3,
        title: 'Browse Issues',
        path: '/authority-category',
        icon: <ListAltIcon />
    },
    {
        id: 4,
        title: 'My Issues',
        path: '/managing-category',
        icon: <SupervisorAccountIcon />
    },
]
