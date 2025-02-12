#sqlpHelper.py
from sqlalchemy import create_engine, text

import pandas as pd

# Define the SQLHelper Class
# PURPOSE: Deal with all of the database logic

class SQLHelper():

    # Initialize PARAMETERS/VARIABLES

    #################################################
    # Database Setup
    #################################################
    def __init__(self):
        self.engine = create_engine("sqlite:///mlb_dataset.sqlite")

    #################################################################

    def queryBarData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text("""SELECT
                        year,
                        team_abv,
                        SUM(HR) AS total_home_runs
                    FROM
                        mlb_dataset
                    GROUP BY
                        year, team_abv
                    ORDER BY
                        year ASC, total_home_runs ASC;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)

    def queryHeatData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect()

        # Define Query - Aggregate total home runs by year and team
        query = text("""SELECT
                        team_abv,
                        AVG(AVG) AS AVG,
                        SUM(HR) AS HR,
                        SUM(R) AS R,
                        SUM(SO) AS SO
                    FROM
                        mlb_dataset
                    GROUP BY
                        year, team_abv;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return df   

    def queryTableData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text("""SELECT 
                        year, player_name, player_position, team, team_abv, G, AB, R, H, 
                        HR, RBI, BB, SO, AVG, league, division 
                    FROM mlb_dataset;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        print(df)
        conn.close()
        return(df)

    def queryMapData(self, selected_year=None):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect()

        # Define Base Query
        query = """SELECT
                    year,
                    team_abv,
                    SUM(HR) AS total_home_runs,
                    latitude,
                    longitude
                FROM
                    mlb_dataset
                """

        # If a year is provided, filter by that year
        if selected_year:
            query += f"WHERE year = {selected_year} "

        query += """GROUP BY
                    year, team_abv, latitude, longitude
                ORDER BY
                    total_home_runs DESC;"""

        # Execute Query
        df = pd.read_sql(text(query), con=conn)

        # Close the connection
        conn.close()
        return df