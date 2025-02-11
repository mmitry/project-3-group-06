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
        conn = self.engine.connect()

        # Define Query - Aggregate total home runs by year and team
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
        return df
    
    def queryTableData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect()

        # Define Query - Fetch all columns except latitude and longitude
        query = text("""SELECT 
                        year, player_name, player_position, team, team_abv, G, AB, R, H, 
                        HR, RBI, BB, SO, AVG, league, division 
                    FROM mlb_dataset;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return df

    def queryMapData(self):
        # Create our session (link) from Python to the DB
        conn = self.engine.connect() # Raw SQL/Pandas

        # Define Query
        query = text("""SELECT
                    team_abv,
                    SUM(HR) AS total_home_runs,
                    latitude,
                    longitude
                FROM
                    mlb_dataset
                GROUP BY
                    team_abv, latitude, longitude
                ORDER BY
                    total_home_runs DESC;""")
        df = pd.read_sql(query, con=conn)

        # Close the connection
        conn.close()
        return(df)
