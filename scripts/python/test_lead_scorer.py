#!/usr/bin/env python3
"""Unit tests for the LeadScorer class."""

import pytest
from lead_scorer import LeadScorer, _parse_amount


class TestParseAmount:
    """Tests for the _parse_amount helper function."""

    def test_integer_value(self):
        assert _parse_amount(5000000) == 5000000.0

    def test_float_value(self):
        assert _parse_amount(5.5e6) == 5.5e6

    def test_string_integer(self):
        assert _parse_amount("5000000") == 5000000.0

    def test_string_with_m_suffix(self):
        assert _parse_amount("5.2M") == 5200000.0

    def test_string_with_k_suffix(self):
        assert _parse_amount("850k") == 850000.0

    def test_string_with_commas(self):
        assert _parse_amount("5,200,000") == 5200000.0

    def test_none_returns_none(self):
        assert _parse_amount(None) is None

    def test_empty_string_returns_none(self):
        assert _parse_amount("") is None

    def test_non_numeric_string_returns_none(self):
        assert _parse_amount("luxury") is None


class TestLeadScorerIntent:
    """Tests for the intent scoring sub-component."""

    def setup_method(self):
        self.scorer = LeadScorer()

    def test_ready_intent_scores_3(self):
        lead = {"intent": "ready to book a viewing"}
        assert self.scorer._score_intent(lead) == 3

    def test_buy_intent_scores_2(self):
        lead = {"stage": "looking to buy"}
        assert self.scorer._score_intent(lead) == 2

    def test_rent_intent_scores_1(self):
        lead = {"status": "rent inquiry"}
        assert self.scorer._score_intent(lead) == 1

    def test_empty_intent_scores_0(self):
        lead = {}
        assert self.scorer._score_intent(lead) == 0


class TestLeadScorerBudget:
    """Tests for the budget scoring sub-component."""

    def setup_method(self):
        self.scorer = LeadScorer()

    def test_high_budget_scores_3(self):
        lead = {"budget": 25000000}
        assert self.scorer._score_budget(lead) == 3

    def test_mid_budget_scores_2(self):
        lead = {"budget_egp": 12000000}
        assert self.scorer._score_budget(lead) == 2

    def test_low_budget_scores_1(self):
        lead = {"price": 3000000}
        assert self.scorer._score_budget(lead) == 1

    def test_luxury_text_budget_scores_3(self):
        lead = {"budget": "luxury segment"}
        assert self.scorer._score_budget(lead) == 3

    def test_no_budget_scores_0(self):
        lead = {}
        assert self.scorer._score_budget(lead) == 0


class TestLeadScorerTimeline:
    """Tests for the timeline scoring sub-component."""

    def setup_method(self):
        self.scorer = LeadScorer()

    def test_urgent_timeline_scores_2(self):
        lead = {"timeline": "need to move immediately"}
        assert self.scorer._score_timeline(lead) == 2

    def test_short_timeline_scores_2(self):
        lead = {"target_move_in": "this month"}
        assert self.scorer._score_timeline(lead) == 2

    def test_medium_timeline_scores_1(self):
        lead = {"notes": "looking to move in 3 months"}
        assert self.scorer._score_timeline(lead) == 1

    def test_no_timeline_scores_0(self):
        lead = {}
        assert self.scorer._score_timeline(lead) == 0


class TestLeadScorerCompound:
    """Tests for the compound target scoring sub-component."""

    def setup_method(self):
        self.scorer = LeadScorer()

    def test_premium_compound_scores_2(self):
        lead = {"compound": "Mivida"}
        assert self.scorer._score_compound_target(lead) == 2

    def test_premium_compound_case_insensitive(self):
        lead = {"compound_target": "hyde park"}
        assert self.scorer._score_compound_target(lead) == 2

    def test_non_premium_compound_scores_1(self):
        lead = {"location": "Nasr City"}
        assert self.scorer._score_compound_target(lead) == 1

    def test_no_compound_scores_0(self):
        lead = {}
        assert self.scorer._score_compound_target(lead) == 0


class TestLeadScorerIntegration:
    """Integration tests for the full score_lead method."""

    def setup_method(self):
        self.scorer = LeadScorer()

    def test_hot_lead_scores_high(self):
        lead = {
            "intent": "ready to buy now",
            "budget": 22000000,
            "timeline": "immediately",
            "compound": "Hyde Park",
        }
        score = self.scorer.score_lead(lead)
        assert 8 <= score <= 10

    def test_cold_lead_scores_low(self):
        lead = {
            "stage": "just browsing",
        }
        score = self.scorer.score_lead(lead)
        assert 1 <= score <= 3

    def test_warm_lead_scores_mid(self):
        lead = {
            "intent": "interested in investing",
            "budget": 8000000,
            "timeline": "6 months",
            "location": "Rehab",
        }
        score = self.scorer.score_lead(lead)
        assert 4 <= score <= 7

    def test_score_is_between_1_and_10(self):
        for lead in [{}, {"budget": 100000000, "intent": "buy now immediately", "compound": "Mivida"}]:
            score = self.scorer.score_lead(lead)
            assert 1 <= score <= 10

    def test_empty_lead_minimum_score(self):
        score = self.scorer.score_lead({})
        assert score == 1

    def test_max_possible_raw_score_capped_at_10(self):
        lead = {
            "intent": "ready to book viewing today",
            "budget": 50000000,
            "timeline": "urgent now",
            "compound": "Mivida",
        }
        score = self.scorer.score_lead(lead)
        assert score == 10
