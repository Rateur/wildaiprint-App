import streamlit as st

# Home page
# Default view
if "view" not in st.session_state:
    st.session_state.view = "home"

# show home page
if st.session_state.view == "home":
    with open("pages/Home.py") as f:
        exec(f.read())
