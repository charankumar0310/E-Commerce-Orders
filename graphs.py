# import matplotlib.pyplot as plt
# import seaborn as sns

# sns.set_theme(style="white")
# plt.rcParams.update({"font.family": "serif", "font.size": 11, "axes.labelsize": 12, "axes.titlesize": 14})

# systems = ['Manual Support Lookup', 'Automated Tracking Engine']
# durations = [34, 1.2]
# colors = ['#d9534f', '#5cb85c']

# fig, ax = plt.subplots(figsize=(6.5, 4.5), dpi=300)
# bars = ax.bar(systems, durations, color=colors, edgecolor='#222222', width=0.35, linewidth=1.2)

# ax.set_axisbelow(True)
# ax.yaxis.grid(True, color='#e5e5e5', linestyle='--', linewidth=0.8)
# # ax.set_title("Graph 5.1: Customer Service Query Turnaround Time Evaluation", pad=20, weight="bold")
# ax.set_ylabel("Query Resolution Duration (Minutes)", labelpad=12)
# ax.set_ylim(0, 40)

# for bar in bars:
#     height = bar.get_height()
#     ax.annotate(f'{height} Mins', xy=(bar.get_x() + bar.get_width() / 2, height),
#                 xytext=(0, 6), textcoords="offset points", ha='center', va='bottom', weight='bold', color='#222222')

# sns.despine(left=False, bottom=False, trim=True)
# plt.tight_layout()
# plt.savefig("graph_5_1_query_efficiency.png", dpi=300, bbox_inches="tight")
# plt.show()


import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
plt.rcParams.update({"font.family": "serif", "font.size": 11, "axes.labelsize": 12, "axes.titlesize": 14})

volume = [0, 2500, 5000, 7500, 10000]
unindexed_ms = [14, 48, 72, 89, 108]
indexed_ms = [11, 23, 24, 26, 28]

fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)
ax.plot(volume, unindexed_ms, label="Unindexed Order State Read Scan", color="#d9534f", linestyle="--", marker="o", linewidth=2)
ax.plot(volume, indexed_ms, label="Indexed Event Pipeline Lookup Engine", color="#0275d8", linestyle="-", marker="s", linewidth=2)

# ax.set_title("Graph 4.1: Processing Latency Analysis under Concurrent Order State Writes", pad=15, weight="bold")
ax.set_xlabel("Simulated Concurrent Orders (Database Row Volume)", labelpad=10)
ax.set_ylabel("Execution Latency (ms)", labelpad=10)
ax.set_xlim(0, 10000)
ax.set_ylim(0, 130)
ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="none")

plt.tight_layout()
plt.savefig("graph_4_1_logistics_latency.png", dpi=300, bbox_inches="tight")
# plt.show()