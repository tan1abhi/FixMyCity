
const fetchAuthToken = async () => {
    try {
        const response = await fetch("https://www.universal-tutorial.com/api/getaccesstoken", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "api-token": "oL38lnLwjOn6Jt_gKAa5NkybI9iZxpEUgWHu7OT9dF6fOqsPpJcLwTSoesqZdBjFg14",
                "user-email": "uselessthings888@gmail.com"
            }
        });
        const data = await response.json();
        return data.auth_token;
    } catch (error) {
        console.error("Error fetching auth token:", error);
        throw new Error('Error fetching auth token');
    }
};

const fetchStates = async (authToken) => {
    try {
        const response = await fetch("https://www.universal-tutorial.com/api/states/India", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Accept": "application/json"
            }
        });
        const data = await response.json();
        return data.map((state) => state.state_name);
    } catch (error) {
        console.error("Error fetching states:", error);
        throw new Error('Error fetching states');
    }
};

const fetchCities = async (authToken, updatedState) => {
    try {
        const response = await fetch(`https://www.universal-tutorial.com/api/cities/${updatedState}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Accept": "application/json"
            }
        });
        const data = await response.json();
        return data.map((city) => city.city_name);
    } catch (error) {
        console.error("Error fetching cities:", error);
        throw new Error('Error fetching cities');
    }
};

export { fetchAuthToken, fetchStates, fetchCities };
