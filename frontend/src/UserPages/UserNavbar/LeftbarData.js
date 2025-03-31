import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
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
        path: '/view-category',
        icon: <ListAltIcon />
    },
    {
        id: 4,
        title: 'Report Issue',
        path: '/category',
        icon: <ReportProblemIcon />
    },
    {
        id: 5,
        title: 'Authorities',
        path: '/authorities',
        icon: <SupervisorAccountIcon />
    },
]
