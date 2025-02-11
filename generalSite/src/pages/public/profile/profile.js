import React, { useEffect, useState } from 'react'
import './profile.css';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../../contexts/auth';
import { useGoogleLogin } from '@react-oauth/google';
import { setStorageData } from '../../../utils/data';

const Profile = () => {
    const [initialProfile, setInitialProfile] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [location, setLocation] = useState("");
    const [errors, setErrors] = useState({});

    const { getProfile, isLoadingGetMe, updateProfile, isLoadingUpdateProfile } = useAuth();
    const navigate = useNavigate();

    const getInitialProfile = async () => {
        const res = await getProfile();
        if (res.success) {
            setInitialProfile(res.data);
            setName(res.data.name);
            setAge(res.data.age);
            setLocation(res.data.location);
            setGender(res.data.gender);
        }
    }

    const validateName = (name) => {
        return name.length >= 4 && name.length < 255;
    };

    const validateGender = (gender) => {
        return gender == 'MALE' || gender == 'FEMALE';
    };

    const validateLocation = (location) => {
        return location.length > 1 && location.length < 255;
    }

    const validateAge = (age) => {
        return Number.isInteger(Number(age)) && Number(age) > 0 && Number(age) < 100;
    }

    const handleUpdateProfileError = (error) => {
        const errorMessage = error?.response?.data?.message;

        switch (error?.response?.data?.name) {
            case 'INVALID_PAYLOAD':
                toast.error("One or more of the fields are invalid", { autoClose: 3000 });
                break;
            case 'NAME_ALREADY_EXISTS':
                toast.error("This name is already used, please choose another one", { autoClose: 3000 });
                break;
            default:
                toast.error(errorMessage || "An error occurred during updating the profile", { autoClose: 3000 });
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const payload = {};
            if (name != initialProfile.name)
                payload.name = name;
            if (age != initialProfile.age)
                payload.age = age;
            if (gender != initialProfile.gender)
                payload.gender = gender;
            if (location != initialProfile.location)
                payload.location = location;

            try {
                const res = await updateProfile(payload);
                if (res?.data?.user) {
                    if (name != initialProfile.name)
                        setStorageData('name', name);

                    setInitialProfile(res.data.user);
                    toast.success("Profile updated successfully");

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                } else {
                    toast.error("Error updating the profile")
                }
            } catch (error) {
                handleUpdateProfileError(error);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!name) {
            newErrors.name = "Name is required";
        } else if (!validateName(name)) {
            newErrors.name =
                "User name should be atleast 4 charachters, and at most 255 charachters";
        }

        if (gender && !validateGender(gender)) {
            newErrors.gender =
                "Gender must be either male or female";
        }

        if (location && !validateLocation(location)) {
            newErrors.location =
                "Location should be atleast 1 charachters, and at most 255 charachters";
        }

        if (age && !validateAge(age)) {
            newErrors.age =
                "Age must be between 0 and 100 yo";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        getInitialProfile();
    }, []);

    if (isLoadingGetMe) return <Loading isVisible={true} />;

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Update Your Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className={errors.name ? "error" : ""}
                            required
                        />
                        {errors.name && (
                            <span className="error-message">{errors.name}</span>
                        )}
                    </div>
                    <div className="auth-form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            type="age"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Enter your age"
                            className={errors.age ? "error" : ""}
                        />
                        {errors.age && (
                            <span className="error-message">{errors.age}</span>
                        )}
                    </div>
                    <div className="profile-radio-group auth-form-group">
                        <label>Gender</label>
                        <label>
                            <input
                                type="radio"
                                value="MALE"
                                checked={gender == 'MALE'}
                                onChange={e => setGender(e.target.value)}
                            />
                            Male
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="FEMALE"
                                checked={gender === 'FEMALE'}
                                onChange={e => setGender(e.target.value)}
                            />
                            Female
                        </label>
                        {errors.gender && (
                            <span className="error-message">{errors.gender}</span>
                        )}
                    </div>
                    <div className="auth-form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="location"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter your location"
                            className={errors.location ? "error" : ""}
                        />
                        {errors.location && (
                            <span className="error-message">{errors.location}</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isLoadingUpdateProfile}
                    >
                        {isLoadingUpdateProfile ? "Updating..." : "Update"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Profile