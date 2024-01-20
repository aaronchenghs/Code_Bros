import React, { useEffect, useState } from "react";
import axios from "axios";
import RestaurantCard from "../Card/restaurantcard2.component";
import {
  setSelectedResturaunt,
  resetSelectedResturaunt,
} from "../../store/Edit/slice";
import styles from "./resturaunts.module.scss"; // Adjust the import path
import { useDispatch } from "react-redux";
import { AppState } from "../../store/store";
import { useSelector } from "react-redux";
import ThemeButton from "../GlobalComponents/ThemeButton/themebutton.component";

// Define the initial Yelp API request options without the location
const initialYelpOptions = {
  method: "GET",
  url: "http://localhost:8080/https://api.yelp.com/v3/businesses/search",
  params: {
    term: "restaurants",
    limit: 45,
  },
  headers: {
    Authorization:
      "Bearer v6Fp_iceiGQRtNa-70WurQPuBzfVS0ldqpsjk29erOHeFTijSZ0i4f1XEK2YPwWTyXp14gxEaG7w17_NXgvteI6YQ7tbbusqgxKgIRzvGQoEML_OJNfCv-TpVVsYZXYx", // Replace with your Yelp API Key
  },
};

type Restaurant = {
  id: string;
  name: string;
  location: {
    state?: string;
    country?: string;
    address1?: string;
    address2?: string;
    city?: string;
    zip_code?: string;
  };
  image_url: string;
};

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [location, setLocation] = useState<string>(""); // State to store the user-provided location
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedRestaurantName, setSelectedRestaurantName] = useState("");

  const dispatch = useDispatch();
  const $selectedRestaurant = useSelector(
    (state: AppState) => state.edit.selectedResturaunt,
  );

  // Combine the initial options with the user-provided location
  const yelpOptions = {
    ...initialYelpOptions,
    params: {
      ...initialYelpOptions.params,
      location: location, // Set the location from user input
    },
  };

  useEffect(() => {
    console.log($selectedRestaurant);
  });

  const handlePickRestaurant = (name: string): void => {
    dispatch(setSelectedResturaunt(name));
  };

  const fetchRestaurants = async (): Promise<void> => {
    try {
      // Make the Yelp API request
      const response = await axios.request(yelpOptions);

      if (response.data.businesses) {
        const restaurantData: Restaurant[] = response.data.businesses.map(
          (business: Restaurant) => ({
            id: business.id,
            name: business.name,
            location: {
              state: business.location.state,
              country: business.location.country,
              address1: business.location.address1,
              address2: business.location.address2,
              city: business.location.city,
              zip_code: business.location.zip_code,
            },
            image_url: business.image_url,
          }),
        );

        setRestaurants(restaurantData);
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault(); // Prevent the form from submitting and reloading the page
    fetchRestaurants(); // Call the API after the form is submitted
  };

  return (
    <div
      style={
        selectedRestaurantId === ""
          ? { overflowY: "hidden" }
          : { overflowY: "auto" }
      }
    >
      <div className={styles["form-holder"]}></div>
      <form style={{ width: 420 }} onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Enter location as City, State (Abbreviation)"
          value={location}
          onChange={(e): void => setLocation(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {selectedRestaurantId.length ? (
        <button onClick={(): void => setSelectedRestaurantId("")}>
          Return to List
        </button>
      ) : null}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        <div className={styles["restaurant-list-container"]}>
          {restaurants
            .filter((restaurant) =>
              !selectedRestaurantId.length
                ? restaurant
                : restaurant.id === selectedRestaurantId,
            )
            .map((restaurant) => (
              <div
                onClick={(): void => {
                  setSelectedRestaurantName(restaurant.name);
                  setSelectedRestaurantId(restaurant.id);
                }}
                key={restaurant.id}
                className={styles["restaurant-card"]}
              >
                <RestaurantCard
                  imageUrl={restaurant.image_url}
                  name={restaurant.name}
                  address={restaurant.location.address1!}
                />
              </div>
            ))}
          {selectedRestaurantId.length ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <ThemeButton
                text={"Choose"}
                onClick={(): void =>
                  handlePickRestaurant(selectedRestaurantName)
                }
                buttonType={"choose"}
              />
              <ThemeButton
                text={"Cancel"}
                onClick={(): void => {
                  setSelectedRestaurantId("");
                  resetSelectedResturaunt;
                }}
                buttonType={"delete"}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;
