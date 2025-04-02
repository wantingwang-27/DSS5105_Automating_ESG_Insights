import matplotlib.pyplot as plt

# Sample ESG trend data
years = [2018, 2019, 2020, 2021, 2022, 2023]
tesla_scores = [70, 75, 78, 80, 82, 85]
microsoft_scores = [72, 74, 76, 79, 81, 84]

# Create a plot
plt.figure(figsize=(8, 5))
plt.plot(years, tesla_scores, marker='o', linestyle='-', label="Tesla")
plt.plot(years, microsoft_scores, marker='s', linestyle='--', label="Microsoft")

# Title and labels
plt.title("ESG Trends Over Time")
plt.xlabel("Year")
plt.ylabel("ESG Score")
plt.legend()
plt.grid(True)

# Save the plot as an image
plt.savefig("esg_trend_plot.png", bbox_inches="tight")
plt.show()
