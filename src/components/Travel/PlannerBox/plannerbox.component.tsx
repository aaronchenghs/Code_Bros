import React, { Fragment, useEffect, useState } from "react";
import styles from "./plannerbox.module.scss";
import ThemeButton from "../../GlobalComponents/ThemeButton/themebutton.component";
import { useDispatch } from "react-redux";
import { updateItineraryNamesByDate } from "../../../store/Data/slice";
import { v4 as uuidv4 } from "uuid";
import { itinerary, meal } from "../../../models/itinerary";

import { Calendar } from "react-calendar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { Icon, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { AppState } from "../../../store/store";

const PlannerBox = (): JSX.Element => {
  const dispatch = useDispatch();

  const $selectedRestaurant = useSelector(
    (state: AppState) => state.edit.selectedResturaunt,
  );

  const [editingName, setEditingName] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const [itineraryName, setItineraryName] = useState("");
  const [currentMeal, setCurrentMeal] = useState<meal>({
    time: "",
    type: "Breakfast",
    location: "",
  });
  const [addingTime, setAddingTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [newItinerary, setNewItinerary] = useState<itinerary>({
    id: uuidv4(),
    month: selectedDate.getMonth() + 1,
    day: selectedDate.getDate(),
    year: selectedDate.getFullYear(),
    meals: [],
    title: "",
  });

  const handleChangeItineraryName = (
    month: number,
    day: number,
    year: number,
    newName: string,
  ): void => {
    dispatch(updateItineraryNamesByDate({ month, day, year, newName }));
  };

  const handleMealSubmit = (): void => {
    setNewItinerary({
      ...newItinerary,
      meals: [...newItinerary.meals, currentMeal],
    });
  };

  const convertTimeToModern = (time: string): string => {
    const parts = time.split(":");

    let hours = parseInt(parts[0], 10);
    const minutes: string = parts[1];

    let ampm = "AM";
    if (hours >= 12) {
      ampm = "PM";
      if (hours > 12) {
        hours -= 12;
      }
    } else if (hours === 0) {
      hours = 12;
    }

    const convertedTimeString = `${hours}:${minutes} ${ampm}`;

    return convertedTimeString;
  };

  useEffect(() => {
    $selectedRestaurant &&
      setCurrentMeal({ ...currentMeal, location: $selectedRestaurant });
  }, [$selectedRestaurant]);

  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    setEditingDate(false);
  };

  return (
    <Fragment>
      <div className={styles.Planner}>
        <div style={{ width: "50%" }}>
          {editingDate && (
            <Calendar
              value={selectedDate}
              onChange={(e): void => handleDateChange(e as Date)}
            />
          )}
        </div>
        <div
          style={{
            marginBottom: "1%",
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!editingName && (
            <Tooltip
              title="Change the name of your daily itinerary."
              placement="left"
              className={styles.tooltip}
            >
              <EditIcon
                className={styles.icon}
                style={{ marginLeft: "1%", cursor: "pointer" }}
                onClick={(): void => setEditingName(!editingName)}
              />
            </Tooltip>
          )}

          {newItinerary && (
            <span className={styles.dateAndTitle}>
              {newItinerary.title} on{" "}
              {selectedDate.getMonth() +
                1 +
                "/" +
                selectedDate.getDate() +
                "/" +
                selectedDate.getFullYear()}
            </span>
          )}

          <Tooltip
            title="Choose your itinerary date!"
            placement="right"
            className={styles.tooltip}
          >
            <AccessTimeIcon
              className={styles.icon}
              style={{ marginRight: "1%", cursor: "pointer" }}
              onClick={(): void => setEditingDate(!editingDate)}
            />
          </Tooltip>

          {editingName && (
            <form style={{ display: "flex", alignItems: "center" }}>
              <input
                value={itineraryName}
                style={{ marginLeft: "1%", width: "50%" }}
                onChange={(e): void => {
                  setItineraryName(e.target.value);
                }}
              />
              <CheckIcon
                className={styles.icon}
                onClick={(): void => {
                  setEditingName(false);
                  setNewItinerary({
                    ...newItinerary,
                    title: itineraryName,
                  });
                  handleChangeItineraryName(
                    selectedDate.getMonth() + 1,
                    selectedDate.getDate(),
                    selectedDate.getFullYear(),
                    itineraryName,
                  );
                }}
              />
            </form>
          )}
        </div>
        <div>
          <ThemeButton
            text={addingTime ? "Cancel Add" : "+ Add New Event"}
            onClick={(): void => setAddingTime(!addingTime)}
          />
        </div>
        <div style={{ marginTop: "1%", marginBottom: "1%" }}>
          Currently Selected Restaurant: {$selectedRestaurant}
        </div>
        {addingTime && (
          <form
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "1%",
              height: 50,
              gap: "3px",
            }}
            onSubmit={(event): void => {
              event.preventDefault();
              handleMealSubmit();
            }}
          >
            <input
              className={styles.PlannerInput}
              type="time"
              onChange={(e): void => {
                setCurrentMeal({ ...currentMeal, time: e.target.value });
              }}
            />
            <select
              className={styles.PlannerInput}
              placeholder="Choose a meal"
              onChange={(e): void => {
                setCurrentMeal({ ...currentMeal, type: e.target.value });
              }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Brunch">Brunch</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <button
              className={styles.plus}
              type="submit"
              disabled={currentMeal.time === "" || currentMeal.type === ""}
            >
              +
            </button>
          </form>
        )}
        <div className={styles.currentItineraryList}>
          {newItinerary.meals
            .sort((a, b) => {
              const dateA = new Date(`1970-01-01 ${a.time}`);
              const dateB = new Date(`1970-01-01 ${b.time}`);
              return dateA.getTime() - dateB.getTime();
            })
            .map((entry, index) => (
              <div key={index} className={styles.mealEntry}>
                {convertTimeToModern(entry.time)} {entry.type} at{" "}
                {entry.location}
                <Icon>
                  {" "}
                  <Delete />
                </Icon>
              </div>
            ))}
        </div>
      </div>
    </Fragment>
  );
};

export default PlannerBox;
