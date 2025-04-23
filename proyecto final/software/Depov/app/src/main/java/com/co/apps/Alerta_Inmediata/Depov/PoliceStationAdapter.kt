
package com.co.apps.Alerta_Inmediata.Depov

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class PoliceStationAdapter(
    private val stations: List<PoliceStationData>,
    private val onItemClick: (PoliceStationData) -> Unit
) : RecyclerView.Adapter<PoliceStationAdapter.StationViewHolder>() {

    class StationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tv_station_name)
        val tvDistance: TextView = view.findViewById(R.id.tv_station_distance)
        val tvPhone: TextView = view.findViewById(R.id.tv_station_phone)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_police_station, parent, false)
        return StationViewHolder(view)
    }

    override fun onBindViewHolder(holder: StationViewHolder, position: Int) {
        val station = stations[position]
        holder.tvName.text = station.name
        holder.tvDistance.text = String.format("%.2f km", station.distance)
        holder.tvPhone.text = "Tel: ${station.phone}"

        holder.itemView.setOnClickListener {
            onItemClick(station)
        }
    }

    override fun getItemCount() = stations.size
}