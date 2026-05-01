package com.example.BackGestion.Repository;

import com.example.BackGestion.Model.CAD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CADRepository extends JpaRepository<CAD, Integer> {
}
