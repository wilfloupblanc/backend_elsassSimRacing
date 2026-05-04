import { Fixture } from "@lyra-js/core"

import { Session } from "@entity/Session"

export class SessionFixtures extends Fixture {
  load = async () => {
    await this.loadSessions()
  }

  private async loadSessions() {
    const sessions = [
      {
        duration_minutes: 15,
        price_normal: 13.9,
        price_member: 11.9,
        is_active: 1,
        intro: "Présentation, sélection du véhicule et du circuit",
        details: "Roulage libre sur simulateur",
        total_duration: "Environ 25 minutes",
        tagline: "Prenez le volant en solo ou entre amis et plongez directement dans l'expérience : choisissez votre tracé et votre voiture, ou faites confiance à notre équipe pour vous orienter selon vos envies.",
        name: "Session 15min",
        level: "Découverte",
        image: "session15min.png",
        min_age: 11,
        min_height: "1.50m",
        min_pilots: 1,
        max_pilots: 6,
      },
      {
        duration_minutes: 30,
        price_normal: 25.9,
        price_member: 21.9,
        is_active: 1,
        intro: "Explications, sélection du véhicule et du tracé",
        details: "20 minutes en roulage libre suivies de 10 minutes de course",
        total_duration: "Environ 40 minutes",
        tagline: "Avec 30 minutes de session, vous avez le temps de vous familiariser avec le circuit : comprendre le fonctionnement du simulateur et vivre pleinement une immersion dans l'univers du sport automobile.",
        name: "Session 30min",
        level: "Initiation",
        image: "session30min.png",
        min_age: 11,
        min_height: "1.50m",
        min_pilots: 1,
        max_pilots: 6,
      },
      {
        duration_minutes: 45,
        price_normal: 32.9,
        price_member: 27.9,
        is_active: 1,
        intro: "Explications, sélection du véhicule et du tracé",
        details: "30 minutes en roulage libre suivies de 15 minutes de course",
        total_duration: "Environ 55 minutes",
        tagline: "Avec 45 minutes de session, vous avez le temps de vous familiariser avec le circuit : comprendre le fonctionnement du simulateur et vivre pleinement une immersion dans l'univers du sport automobile.",
        name: "Session 45min",
        level: "Confirmé",
        image: "session45min.png",
        min_age: 11,
        min_height: "1.50m",
        min_pilots: 1,
        max_pilots: 6,
      },
      {
        duration_minutes: 60,
        price_normal: 39.9,
        price_member: 33.9,
        is_active: 1,
        intro: "Explications, sélection du véhicule et du tracé",
        details: "40 minutes en roulage libre suivies de 20 minutes de course",
        total_duration: "Environ 70 minutes",
        tagline: "Avec 60 minutes de session, vous avez le temps de vous familiariser avec le circuit : comprendre le fonctionnement du simulateur et vivre pleinement une immersion dans l'univers du sport automobile.",
        name: "Session 60min",
        level: "Expert",
        image: "session60min.png",
        min_age: 11,
        min_height: "1.50m",
        min_pilots: 1,
        max_pilots: 6,
      },
      {
        duration_minutes: 60,
        price_normal: 36.9,
        price_member: 29.9,
        is_active: 1,
        intro: "Briefing technique, attribution des numéros de course et qualification du tracé",
        details: "15 minutes d'essais libres pour apprendre le circuit, 10 minutes de qualifications pour établir la grille de départ, puis 40 minutes de course intense en face à face",
        total_duration: "Environ 75 minutes",
        tagline: "Vivez l'adrénaline d'un vrai week-end de Grand Prix : qualifications, grille de départ et bataille roue contre roue. Le format le plus complet pour les pilotes qui veulent se mesurer à leurs adversaires.",
        name: "Session Grand Prix 65min",
        level: "Expert",
        image: "sessionGrandPrix.png",
        min_age: 16,
        min_height: "1.50m",
        min_pilots: 4,
        max_pilots: 6,
      },
    ]

    for (const s of sessions) {
      const session = new Session()
      session.duration_minutes = s.duration_minutes
      session.price_normal = s.price_normal
      session.price_member = s.price_member
      session.is_active = s.is_active
      session.intro = s.intro
      session.details = s.details
      session.total_duration = s.total_duration
      session.tagline = s.tagline
      session.name = s.name
      session.level = s.level
      session.image = s.image
      session.min_age = s.min_age
      session.min_height = s.min_height
      session.min_pilots = s.min_pilots
      session.max_pilots = s.max_pilots
      await this.sessionRepository.save(session)
    }
  }
}